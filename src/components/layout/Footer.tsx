/**
 * Footer component for site-wide footer
 */
export default function Footer() {
  return (
    <footer className="bg-white shadow dark:bg-gray-900 mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Student Timetable App. All rights reserved.
          </div>
          <div className="mt-2 md:mt-0">
            <ul className="flex space-x-4">
              <li>
                <a 
                  href="#" 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Help
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
} 