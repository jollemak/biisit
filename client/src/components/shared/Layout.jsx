import TabNavigation from './TabNavigation';

export default function Layout({ children, showTabs = true }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8 text-center">Song Lyrics App</h1>

        {showTabs && <TabNavigation />}

        {children}
      </div>
    </div>
  );
}