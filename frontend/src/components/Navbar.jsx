import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }
  return (
    <div className="w-full h-full p-4 flex justify-center items-center sticky shadow-md">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink>
              <Link to={"/dashboard"}>Dashboard</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Income</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink >
                <Link to={"/incomes"}>View Income</Link>
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Expenses</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink >
                <Link to={"/expenses"}>View Expenses</Link>
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Account</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink onClick={handleLogout}>
                Log out
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
