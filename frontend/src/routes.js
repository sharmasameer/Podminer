import { Assignment, Equalizer, ExitToApp, Favorite, Group, List as ListIcon, Person, PieChart, VpnKey, Place, TrendingUp, Public, Apps } from "@material-ui/icons";
import AdminTasks from "views/AdminTasks/AdminTasks";
import DashboardPage from "views/Dashboard/Dashboard.js";
import Login from "views/Login/Login";
import Logout from "views/Logout/Logout";
import ShowRankings from "views/Show/ShowRankings";
import ShowList from "views/ShowList/ShowList";
import TableList from "views/TableList/TableList.js";
import UserManagement from "views/UserManagement/UserManagement";
import UserMetrics from "views/UserMetrics/UserMetrics";
import UserProfile from "views/UserProfile/UserProfile";
import ByCategory from "views/PowerRankings/ByCategory";
import ByRegion from "views/PowerRankings/ByRegion";
import ByCountry from "views/PowerRankings/ByCountry";
import PowerRankings from "views/PowerRankings/PowerRankings";

const dashboardRoutes = [
  {
    path: "/top100",
    name: "Global Top 100",
    icon: TrendingUp,
    component: PowerRankings,
    layout: "/admin",
  },
  {
    path: "/top100/country/Singapore",
    name: "By Country",
    icon: Public,
    component: ByCountry,
    layout: "/admin",
  },
  {
    path: "/top100/region/Southeast_Asia",
    name: "By Region",
    icon: Place,
    component: ByRegion,
    layout: "/admin",
  },
  {
    path: "/top100/category/Business",
    name: "By Category",
    icon: Apps,
    component: ByCategory,
    layout: "/admin",
  },
  {
    path: "/rankings/Singapore/Business",
    name: "Podcast Rankings",
    rtlName: "قائمة الجدول",
    icon: Equalizer,
    component: TableList,
    layout: "/admin",
  },
  {
    path: "/myfollows",
    name: "My Follows",
    rtlName: "لوحة القيادة",
    icon: Favorite,
    component: DashboardPage,
    layout: "/admin",
  },
  {
    path: "/search",
    name: "Search Podcasts",
    rtlName: "قائمة الجدول",
    icon: ListIcon,
    component: ShowList,
    layout: "/admin",
  },
  {
    path: "/podcast/:showId/:showSlug",
    name: "Podcast Ranking",
    rtlName: "قائمة الجدول",
    icon: ListIcon,
    component: ShowRankings,
    layout: "/admin",
    invisible: true,
  },
  {
    path: "/tasks/:taskId",
    name: "Admin Tasks",
    icon: Assignment,
    component: AdminTasks,
    layout: "/admin",
    invisible: true
  },
  {
    path: "/settings",
    name: "Edit Profile",
    rtlName: "ملف تعريفي للمستخدم",
    icon: Person,
    component: UserProfile,
    layout: "/admin",
  },
  {
    path: "/login",
    name: "Login",
    icon: VpnKey,
    component: Login,
    layout: "/admin",
  },
  {
    path: "/user",
    name: "User Management",
    icon: Group,
    component: UserManagement,
    layout: "/admin",
  },
  {
    path: "/metrics",
    name: "User Metrics",
    icon: PieChart,
    component: UserMetrics,
    layout: "/admin",
  },
  {
    path: "/tasks",
    name: "Admin Tasks",
    icon: Assignment,
    component: AdminTasks,
    layout: "/admin",
  },
  {
    path: "/logout",
    name: "Logout",
    icon: ExitToApp,
    component: Logout,
    layout: "/admin",
  }
];

export default dashboardRoutes;
