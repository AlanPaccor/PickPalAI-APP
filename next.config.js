/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    'react-native',
    'expo',
    '@expo/vector-icons',
    'react-native-web',
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
    };
    return config;
  },
}

module.exports = nextConfig 