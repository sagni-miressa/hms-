import { LogoIcon } from "./LogoIcon";

interface LogoProps {
    isCollapsed?: boolean;
}

export const Logo = ({ isCollapsed }: LogoProps) => (
  <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
    <div className={`flex items-center justify-center  bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 ${isCollapsed ? "w-8 h-8 rounded-lg p-4" : "h-12 w-12 rounded-xl"}`}>
      <LogoIcon />
    </div>
    <div className={isCollapsed ? "hidden" : ""}>
      <h1 className="text-xl font-bold">RecruitHub</h1>
    </div>
  </div>
);
