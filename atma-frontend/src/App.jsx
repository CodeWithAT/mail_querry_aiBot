// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Home from './Home';
// import Atma from './Atma';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/atma" element={<Atma />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;



import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';
import Atma from './Atma';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col lg:flex-row w-screen h-screen bg-[#010308] overflow-hidden">
        
        {/* Left Side (Desktop) / Top Side (Mobile) : The Neural Core UI */}
        <div className="w-full lg:w-1/2 h-[55vh] lg:h-screen relative border-b lg:border-b-0 lg:border-r border-white/10 z-10">
          <Home />
        </div>
        
        {/* Right Side (Desktop) / Bottom Side (Mobile) : The Telemetry */}
        <div className="w-full lg:w-1/2 h-[45vh] lg:h-screen relative overflow-y-auto lg:overflow-hidden flex items-center justify-center">
          <Atma />
        </div>

      </div>
    </BrowserRouter>
  );
}