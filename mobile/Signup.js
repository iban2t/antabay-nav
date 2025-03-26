import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Modal,
  ScrollView,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import config from './config';

const UserAgreement = ({ visible, onAccept, onDecline }) => {
  const handleCall = () => {
    Linking.openURL('tel:09569841050');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:joivillanueva@gbox.ncf.edu.ph');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView style={styles.agreementScroll}>
            <Text style={styles.agreementTitle}>User Privacy Agreement for AntabayNav</Text>
            <Text style={styles.agreementDate}>Effective Date: March 24, 2025</Text>
            
            <Text style={styles.agreementSection}>1. Introduction</Text>
            <Text style={styles.agreementText}>
              This User Privacy Agreement outlines how AntabayNav ("the App") collects, uses, discloses, and protects your personal information. By using the App, you agree to the terms outlined in this agreement. Your privacy is important to us, and we are committed to safeguarding your information.
            </Text>

            <Text style={styles.agreementSection}>2. Information We Collect</Text>
            <Text style={styles.agreementText}>
              • Personal Information: When you create an account, we may collect personal information such as your name, email address, phone number, and emergency contacts.{'\n'}
              • Location Data: The App utilizes GPS technology to provide real-time location tracking, safe and danger zone generation, and distress signal transmission.{'\n'}
              • Usage Data: We may collect information about how you interact with the App, including features used, duration of use, and interaction logs.
            </Text>

            <Text style={styles.agreementSection}>3. How We Use Your Information</Text>
            <Text style={styles.agreementText}>
              • To Provide Services: Your information is used to operate and maintain the App, including location tracking and distress signal functionalities.{'\n'}
              • To Communicate: We may use your contact information to send updates, notifications, and respond to inquiries.{'\n'}
              • To Improve Our Services: We analyze usage data to enhance the App's features and user experience.{'\n'}
              • For Safety and Security: Your information may be used to detect and prevent fraudulent or illegal activities.
            </Text>

            <Text style={styles.agreementSection}>4. Data Sharing and Disclosure</Text>
            <Text style={styles.agreementText}>
              • Emergency Services: In case of distress, your location data and distress signals may be shared with emergency responders and your designated contacts.{'\n'}
              • Service Providers: We may employ third-party service providers to assist in delivering our services.{'\n'}
              • Legal Compliance: We may disclose your information if required to do so by law or in response to valid requests by public authorities.
            </Text>

            <Text style={styles.agreementSection}>5. Warning: Misuse of Distress Signals and Reports</Text>
            <Text style={styles.agreementText}>
              Using the AntabayNav application responsibly is crucial for ensuring the safety and security of all users.{'\n\n'}
              • False Distress Signals and Reports: Submitting a fake distress signal or report is strictly prohibited.{'\n'}
              • Consequences of Misuse: Misuse of the distress signal feature may result in legal consequences, including potential criminal charges for false reporting.
            </Text>

            <Text style={styles.agreementSection}>6. Data Security</Text>
            <Text style={styles.agreementText}>
              We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure. However, please be aware that no method of transmission over the Internet or method of electronic storage is 100% secure.
            </Text>

            <Text style={styles.agreementSection}>7. User Rights</Text>
            <Text style={styles.agreementText}>
              You have the right to access, correct, or delete your personal information. You may also withdraw your consent for us to use your information at any time, although this may affect your ability to use certain features of the App.
            </Text>

            <Text style={styles.agreementSection}>8. Changes to This Agreement</Text>
            <Text style={styles.agreementText}>
              We may update this User Privacy Agreement from time to time. Any changes will be posted on this page with an updated effective date. Your continued use of the App after any modifications constitutes your acceptance of the new terms.
            </Text>

            <Text style={styles.agreementSection}>9. Contact Us</Text>
            <Text style={styles.agreementText}>
              If you have any questions about this User Privacy Agreement or our privacy practices, please contact us at:{'\n\n'}
              Joshua Ivan Villanueva{'\n'}
              <Text style={styles.link} onPress={handleCall}>0956 984 1050</Text>{'\n'}
              <Text style={styles.link} onPress={handleEmail}>joivillanueva@gbox.ncf.edu.ph</Text>
            </Text>

            <Text style={styles.agreementFooter}>
              By using AntabayNav, you acknowledge that you have read and understood this User Privacy Agreement and agree to be bound by its terms.
            </Text>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.modalButton, styles.declineButton]} onPress={onDecline}>
              <Text style={styles.modalButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.acceptButton]} onPress={onAccept}>
              <Text style={styles.modalButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role_id: 3,
    num: '',
    email: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAgreement, setShowAgreement] = useState(true);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const navigation = useNavigation();

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSignup = async () => {
    if (!agreementAccepted) {
      Alert.alert('Error', 'Please accept the User Privacy Agreement to continue.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${config.API_BASE_URL}/auth/register`, formData);
      if (response.status === 201) {
        Alert.alert('Success', 'User registered successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || 'Signup failed');
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptAgreement = () => {
    setAgreementAccepted(true);
    setShowAgreement(false);
  };

  const handleDeclineAgreement = () => {
    Alert.alert(
      'Agreement Required',
      'You must accept the User Privacy Agreement to create an account.',
      [{ text: 'OK' }]
    );
  };

  return (
    <LinearGradient
      colors={['rgba(42,0,58,1)', 'rgba(128,0,128,1)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <UserAgreement 
        visible={showAgreement}
        onAccept={handleAcceptAgreement}
        onDecline={handleDeclineAgreement}
      />

      <View style={styles.form}>
        <Text style={styles.title}>Antabay Signup</Text>
        <Text style={styles.subtitle}>Please enter your details to create an account</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={formData.username}
          onChangeText={(value) => handleInputChange('username', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Cellphone Number"
          value={formData.num}
          onChangeText={(value) => handleInputChange('num', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={formData.address}
          onChangeText={(value) => handleInputChange('address', value)}
        />

        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignup}
          disabled={isLoading || !agreementAccepted}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Signing up...' : agreementAccepted ? 'Sign Up' : 'Accept Agreement First'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.signUpText}>
          Already have an account?{' '}
          <Text
            style={styles.signUpLink}
            onPress={() => navigation.navigate('Login')}
          >
            Login
          </Text>
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 10,
    paddingLeft: 10,
  },
  button: {
    backgroundColor: '#800080',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
  },
  signUpText: {
    marginTop: 20,
  },
  signUpLink: {
    color: '#800080',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 8,
    padding: 20,
  },
  agreementScroll: {
    maxHeight: '80%',
  },
  agreementTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  agreementDate: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  agreementSection: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  agreementText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  agreementFooter: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 20,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#800080',
  },
  declineButton: {
    backgroundColor: '#ff4444',
  },
  modalButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  link: {
    color: '#800080',
    textDecorationLine: 'underline',
  },
});

export default Signup;
