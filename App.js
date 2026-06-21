import { SafeAreaProvider } from 'react-native-safe-area-context';
import UserApp from './src/apps/user/UserApp';

export default function App() {
  return (
    <SafeAreaProvider>
      <UserApp />
    </SafeAreaProvider>
  );
}
