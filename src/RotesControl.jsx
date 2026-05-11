import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from "./app/index.jsx";
import TestOS from './app/TestOS.jsx';
import TestScreen from './app/TestScreen.jsx';
import { hideWebScrollbar } from './utils/hideScrollbar';

const Stack = createNativeStackNavigator();

hideWebScrollbar();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="index">
        <Stack.Screen name="index" component={HomeScreen} />
        <Stack.Screen name="Test" component={TestScreen} />
        <Stack.Screen name="TestOS" component={TestOS} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}