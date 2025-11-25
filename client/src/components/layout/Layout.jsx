import DashboardHeader from '../dashboard/DashboardHeader.jsx';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-secondary text-white">
      <DashboardHeader />
      <main className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
