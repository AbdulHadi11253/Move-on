import { createNativeStackNavigator } from "@react-navigation/native-stack";
import JourneyScreen from "../screens/main/JourneyScreen";
import JourneyDayDetailScreen from "../screens/main/JourneyDayDetailScreen";

const Stack = createNativeStackNavigator();

export default function JourneyNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="JourneyList" component={JourneyScreen} />
      <Stack.Screen name="JourneyDayDetail" component={JourneyDayDetailScreen} />
    </Stack.Navigator>
  );
}
