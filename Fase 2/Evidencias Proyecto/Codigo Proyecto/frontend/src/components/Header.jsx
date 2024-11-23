import { AuthContext } from "@/app/App";
import { useContext } from "react";

export const Header = () => {
  const {loggedInUser} = useContext(AuthContext);
  return (
    <div className="header">
      <div className="user-info">
        <div className="avatar"></div>
        <p>{loggedInUser.username.toUpperCase()}</p>
      </div>
    </div>
  )
}
