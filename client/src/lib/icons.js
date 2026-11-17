import {
  Activity, AlertTriangle, BarChart3, Boxes, Briefcase, Building2, CheckCircle2, Clock, Cloud,
  CloudUpload, Code2, Compass, Database, Globe, GraduationCap, Headphones, Hourglass, Layers,
  Layout, LayoutDashboard, Package, Palette, PenTool, QrCode, Rocket, ScanLine, ShieldCheck,
  ShoppingCart, Sliders, Smartphone, Sparkles, Target, Terminal, TrendingUp, Truck, Utensils, Workflow,
} from 'lucide-react';

// Icon names stored in Postgres → Lucide components.
const registry = {
  Activity, Boxes, Briefcase, Building2, CheckCircle2, Cloud, Code2, Compass, Database, Globe,
  GraduationCap, Headphones, Layout, Palette, PenTool, Rocket, ShieldCheck, Sliders, Smartphone,
  Target, Terminal, TrendingUp, Utensils,
  // kebab-case names used by the dashboard tables
  activity: Activity,
  alert: AlertTriangle,
  'bar-chart': BarChart3,
  clock: Clock,
  'cloud-upload': CloudUpload,
  database: Database,
  hourglass: Hourglass,
  layers: Layers,
  'layout-dashboard': LayoutDashboard,
  package: Package,
  'qr-code': QrCode,
  'scan-line': ScanLine,
  'shopping-cart': ShoppingCart,
  smartphone: Smartphone,
  truck: Truck,
  workflow: Workflow,
};

export function getIcon(name) {
  return registry[name] ?? Sparkles;
}
