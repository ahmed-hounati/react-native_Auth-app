import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';


import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl ;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('login');
  const [profileTab, setProfileTab] = useState('info');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [updateForm, setUpdateForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        await fetchUserInfo(storedToken);
      }
    } catch (error) {
      console.error('Error checking token:', error);
    }
  };

  const fetchUserInfo = async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/user`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserInfo(data);
        setUpdateForm({
          name: data.name,
          email: data.email,
          password: '',
          password_confirmation: '',
        });
        setIsLoggedIn(true);
      } else {
        await AsyncStorage.removeItem('token');
        setToken(null);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch user info. Check your connection.');
      console.error('Fetch user error:', err);
    }
  };

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
          console.log(loginForm)


    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      console.log(data)
      if (res.ok) {
        setToken(data.token);
        await AsyncStorage.setItem('token', data.token);
        await fetchUserInfo(data.token);
        Alert.alert('Success', 'Login successful!');
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Connection error. Check API_URL: ' + API_URL);
      console.error('Login error:', err);
    }
  };

  const handleRegister = async () => {
    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.password_confirmation) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (registerForm.password !== registerForm.password_confirmation) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      
      if (res.ok) {
        Alert.alert('Success', 'Registration successful! Please login.');
        setActiveTab('login');
        setRegisterForm({
          name: '',
          email: '',
          password: '',
          password_confirmation: '',
        });
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Connection error. Check API_URL: ' + API_URL);
      console.error('Register error:', err);
    }
  };

  const handleUpdate = async () => {
    if (updateForm.password && updateForm.password !== updateForm.password_confirmation) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateForm),
      });
      const data = await res.json();
      
      if (res.ok) {
        setUserInfo(data.user);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', data.message || 'Update failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Connection error');
      console.error('Update error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    setToken(null);
    setIsLoggedIn(false);
    await AsyncStorage.removeItem('token');
    Alert.alert('Success', 'Logged out successfully');
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.gradientBg}>
          <View style={styles.authCard}>
            <Text style={styles.logo}>Auth</Text>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                onPress={() => setActiveTab('login')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'login' && styles.activeTabText,
                  ]}
                >
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'register' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('register')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'register' && styles.activeTabText,
                  ]}
                >
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'login' ? (
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#888"
                  value={loginForm.email}
                  onChangeText={(text) =>
                    setLoginForm({ ...loginForm, email: text })
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#888"
                  value={loginForm.password}
                  onChangeText={(text) =>
                    setLoginForm({ ...loginForm, password: text })
                  }
                  secureTextEntry
                />
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#888"
                  value={registerForm.name}
                  onChangeText={(text) =>
                    setRegisterForm({ ...registerForm, name: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#888"
                  value={registerForm.email}
                  onChangeText={(text) =>
                    setRegisterForm({ ...registerForm, email: text })
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#888"
                  value={registerForm.password}
                  onChangeText={(text) =>
                    setRegisterForm({ ...registerForm, password: text })
                  }
                  secureTextEntry
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#888"
                  value={registerForm.password_confirmation}
                  onChangeText={(text) =>
                    setRegisterForm({
                      ...registerForm,
                      password_confirmation: text,
                    })
                  }
                  secureTextEntry
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleRegister}
                >
                  <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBg}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome, {userInfo.name}</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, profileTab === 'info' && styles.activeTab]}
            onPress={() => setProfileTab('info')}
          >
            <Text
              style={[
                styles.tabText,
                profileTab === 'info' && styles.activeTabText,
              ]}
            >
              Profile Info
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, profileTab === 'logout' && styles.activeTab]}
            onPress={() => setProfileTab('logout')}
          >
            <Text
              style={[
                styles.tabText,
                profileTab === 'logout' && styles.activeTabText,
              ]}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {profileTab === 'info' ? (
            <View style={styles.profileCard}>
              <Text style={styles.sectionTitle}>Update Profile</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#888"
                value={updateForm.name}
                onChangeText={(text) =>
                  setUpdateForm({ ...updateForm, name: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                value={updateForm.email}
                onChangeText={(text) =>
                  setUpdateForm({ ...updateForm, email: text })
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="New Password (optional)"
                placeholderTextColor="#888"
                value={updateForm.password}
                onChangeText={(text) =>
                  setUpdateForm({ ...updateForm, password: text })
                }
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                placeholderTextColor="#888"
                value={updateForm.password_confirmation}
                onChangeText={(text) =>
                  setUpdateForm({ ...updateForm, password_confirmation: text })
                }
                secureTextEntry
              />
              <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                <Text style={styles.buttonText}>Update Profile</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profileCard}>
              <Text style={styles.sectionTitle}>Logout</Text>
              <Text style={styles.logoutText}>
                Are you sure you want to logout?
              </Text>
              <TouchableOpacity
                style={[styles.button, styles.logoutButton]}
                onPress={handleLogout}
              >
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  gradientBg: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  authCard: {
    margin: 20,
    marginTop: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#8b5cf6',
  },
  tabText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  logoutText: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
  },
});