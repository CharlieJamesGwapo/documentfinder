import DashboardHeader from '../dashboard/DashboardHeader.jsx';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-secondary text-white">
      <DashboardHeader />
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 lg:flex-row">
        {children}
      </main>
    </div>
  );
};

export default Layout;
