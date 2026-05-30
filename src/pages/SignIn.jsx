import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { AuraLogo } from './Landing';

export default function SignIn({ onNavigate, onSignIn, isLaptopDimensions, theme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isDark = theme === 'dark';
  const themeStyles = isDark ? darkTheme : lightTheme;

  const handleSubmit = () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    // Simulate successful sign in
    onSignIn({ email, username: email.split('@')[0] });
  };

  const handleAnonymous = () => {
    onSignIn({ email: 'anonymous@aura.archive', username: 'Anonymous User', isAnonymous: true });
  };

  const formCard = (
    <View style={[styles.card, themeStyles.cardBg, themeStyles.cardBorder]}>
      {/* Header Logo */}
      <View style={styles.cardHeader}>
        <TouchableOpacity onPress={() => onNavigate('landing')}>
          <AuraLogo isLarge={false} />
        </TouchableOpacity>
        <Text style={[styles.cardTitle, themeStyles.textMain]}>Sign In to AURA</Text>
        <Text style={[styles.cardSubtitle, themeStyles.textMuted]}>Access the anonymous report archive</Text>
      </View>

      {/* Error message */}
      {!!error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Inputs */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, themeStyles.textMuted]}>Email Address</Text>
        <TextInput
          style={[styles.input, themeStyles.inputBg, themeStyles.inputBorder, themeStyles.textMain]}
          value={email}
          onChangeText={setEmail}
          placeholder="e.g. pilot-71@aura.archive"
          placeholderTextColor={isDark ? '#5a7aaa' : '#94a3b8'}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, themeStyles.textMuted]}>Password</Text>
        <TextInput
          style={[styles.input, themeStyles.inputBg, themeStyles.inputBorder, themeStyles.textMain]}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={isDark ? '#5a7aaa' : '#94a3b8'}
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity 
        id="signin-submit"
        onPress={handleSubmit} 
        style={styles.btnSubmit}
      >
        <Text style={styles.btnSubmitText}>Sign In</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={[styles.dividerLine, themeStyles.dividerColor]} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={[styles.dividerLine, themeStyles.dividerColor]} />
      </View>

      {/* Anonymous action */}
      <TouchableOpacity
        id="signin-anonymous"
        onPress={handleAnonymous}
        style={[styles.btnAnonymous, themeStyles.btnAnonymousBorder]}
      >
        <Text style={styles.btnAnonymousText}>Continue Anonymously</Text>
      </TouchableOpacity>

      {/* Toggle link */}
      <TouchableOpacity
        id="link-signup"
        onPress={() => onNavigate('signup')}
        style={styles.toggleLink}
      >
        <Text style={styles.toggleLinkText}>
          Don't have an account? <Text style={styles.toggleLinkHighlight}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, themeStyles.bgDeep]} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {isLaptopDimensions ? (
        <View style={styles.laptopLayout}>
          {/* Left panel: Cosmic Graphic */}
          <View style={[styles.laptopGraphicPanel, themeStyles.graphicPanelBg, themeStyles.cardBorder]}>
            <View style={styles.radarRingOuter}>
              <View style={styles.radarRingInner} />
            </View>
            <View style={styles.graphicContent}>
              <AuraLogo isLarge={true} />
              <Text style={[styles.graphicTitle, themeStyles.textMain]}>AURA ARCHIVE</Text>
              <Text style={styles.graphicTag}>ACCESS SECURE TERMINAL</Text>
              <Text style={[styles.graphicDesc, themeStyles.textMuted]}>
                Connect your interface to archives anonymously.
              </Text>
            </View>
          </View>
          {/* Right panel: Form */}
          <View style={styles.laptopFormPanel}>
            {formCard}
          </View>
        </View>
      ) : (
        <View style={styles.phoneLayout}>
          {formCard}
        </View>
      )}

      <Text style={styles.footerQuote}>"Your identity stays yours."</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  laptopLayout: {
    flexDirection: 'row',
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
  phoneLayout: {
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  laptopGraphicPanel: {
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    position: 'relative',
    borderRightWidth: 1,
    minHeight: 520,
  },
  radarRingOuter: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: 'rgba(58, 107, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRingInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(176, 106, 255, 0.05)',
  },
  graphicContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  graphicTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 16,
    marginBottom: 4,
  },
  graphicTag: {
    color: '#3a6bff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 12,
  },
  graphicDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 240,
  },
  laptopFormPanel: {
    flex: 1,
    justifyContent: 'center',
    padding: 40,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11,
  },
  errorContainer: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 146, 43, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 146, 43, 0.3)',
    marginBottom: 16,
  },
  errorText: {
    color: '#ff922b',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
  },
  btnSubmit: {
    backgroundColor: '#3a6bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#3a6bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  btnSubmitText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 10,
    color: '#5a7aaa',
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  btnAnonymous: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  btnAnonymousText: {
    color: '#b06aff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  toggleLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleLinkText: {
    fontSize: 12,
    color: '#5a7aaa',
  },
  toggleLinkHighlight: {
    color: '#3a6bff',
    fontWeight: 'bold',
  },
  footerQuote: {
    textAlign: 'center',
    fontSize: 11,
    color: '#5a7aaa',
    fontStyle: 'italic',
    marginTop: 24,
  },
});

const darkTheme = StyleSheet.create({
  bgDeep: {
    backgroundColor: '#060b13',
  },
  textMain: {
    color: '#c8d8ff',
  },
  textMuted: {
    color: '#5a7aaa',
  },
  cardBg: {
    backgroundColor: '#0a1220',
  },
  cardBorder: {
    borderColor: '#15223c',
  },
  inputBg: {
    backgroundColor: '#070c14',
  },
  inputBorder: {
    borderColor: '#15223c',
  },
  dividerColor: {
    backgroundColor: '#15223c',
  },
  btnAnonymousBorder: {
    borderColor: '#15223c',
    backgroundColor: 'rgba(176, 106, 255, 0.05)',
  },
  graphicPanelBg: {
    backgroundColor: '#040814',
  },
});

const lightTheme = StyleSheet.create({
  bgDeep: {
    backgroundColor: '#f4f7fc',
  },
  textMain: {
    color: '#0f172a',
  },
  textMuted: {
    color: '#64748b',
  },
  cardBg: {
    backgroundColor: '#ffffff',
  },
  cardBorder: {
    borderColor: '#cbd5e1',
  },
  inputBg: {
    backgroundColor: '#f8fafc',
  },
  inputBorder: {
    borderColor: '#cbd5e1',
  },
  dividerColor: {
    backgroundColor: '#cbd5e1',
  },
  btnAnonymousBorder: {
    borderColor: '#cbd5e1',
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
  },
  graphicPanelBg: {
    backgroundColor: '#e2eaf4',
  },
});
