import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminHomeScreen from "../screens/admin/AdminHomeScreen";
import AdminQuotesScreen from "../screens/admin/AdminQuotesScreen";
import AdminTasksScreen from "../screens/admin/AdminTasksScreen";
import AdminLessonsScreen from "../screens/admin/AdminLessonsScreen";
import AdminJourneysScreen from "../screens/admin/AdminJourneysScreen";
import AdminJourneyDaysScreen from "../screens/admin/AdminJourneyDaysScreen";
import AdminUsersScreen from "../screens/admin/AdminUsersScreen";
import AdminPromoCardsScreen from "../screens/admin/AdminPromoCardsScreen";
import AdminNotificationsScreen from "../screens/admin/AdminNotificationsScreen";
import AdminContentScreen from "../screens/admin/AdminContentScreen";
import AdminOnboardingQuestionsScreen from "../screens/admin/AdminOnboardingQuestionsScreen";
import AdminQuotePostsScreen from "../screens/admin/AdminQuotePostsScreen";
import AdminQuoteCategoriesScreen from "../screens/admin/AdminQuoteCategoriesScreen";
import AdminAffirmationsScreen from "../screens/admin/AdminAffirmationsScreen";

const Stack = createNativeStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
      <Stack.Screen name="AdminQuotes" component={AdminQuotesScreen} />
      <Stack.Screen name="AdminTasks" component={AdminTasksScreen} />
      <Stack.Screen name="AdminLessons" component={AdminLessonsScreen} />
      <Stack.Screen name="AdminJourneys" component={AdminJourneysScreen} />
      <Stack.Screen name="AdminJourneyDays" component={AdminJourneyDaysScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminPromoCards" component={AdminPromoCardsScreen} />
      <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
      <Stack.Screen name="AdminContent" component={AdminContentScreen} />
      <Stack.Screen name="AdminOnboardingQuestions" component={AdminOnboardingQuestionsScreen} />
      <Stack.Screen name="AdminQuotePosts" component={AdminQuotePostsScreen} />
      <Stack.Screen name="AdminQuoteCategories" component={AdminQuoteCategoriesScreen} />
      <Stack.Screen name="AdminAffirmations" component={AdminAffirmationsScreen} />
    </Stack.Navigator>
  );
}
