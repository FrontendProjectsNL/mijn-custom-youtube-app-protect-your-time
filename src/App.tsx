// import './App.css'
// import { useState } from 'react';
// import { Select as AccessibleCustomSelect } from './Components/AccessibleCustomSelect'
import { Youtube } from './Components/Youtube/Youtube';


// const options = [
//   {
//     value: 'kai',
//     label: 'Kai',
//     tag: 'Fire'
//   },
//   {
//     value: 'nya',
//     label: 'Nya',
//     tag: 'Water'
//   },
//   {
//     value: 'lloyd',
//     label: 'Lloyd',
//     tag: 'Life'
//   },
//   {
//     value: 'zane',
//     label: 'Zane',
//     tag: 'Ice'
//   },
//   {
//     value: 'cole',
//     label: 'Cole',
//     tag: 'Earth'
//   },
//   {
//     value: 'jay',
//     label: 'Jay'
// },
// {
// value: 'garmadon',
// label: 'Garmadon'
// }
// ];

function App() {
  // const [v, setV] = useState('lloyd');

  return (
    <>
      {/* <AccessibleCustomSelect    
      options={options}
   value={v}
   onChange={setV}
   label="Pick your favourite Ninjago character: "
   /> */}
   <Youtube />
    </>
  )
}

export default App
