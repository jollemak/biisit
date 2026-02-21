import { NavLink } from 'react-router-dom';

export default function TabNavigation() {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-gray-800 rounded-lg p-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `px-6 py-2 rounded-md font-medium transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`
          }
        >
          All Songs
        </NavLink>
        <NavLink
          to="/setlists"
          className={({ isActive }) =>
            `px-6 py-2 rounded-md font-medium transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`
          }
        >
          My Setlists
        </NavLink>
      </div>
    </div>
  );
}