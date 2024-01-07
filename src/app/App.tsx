import './App.css';
import { Box, ChakraProvider } from '@chakra-ui/react'
import { AbsoluteCenter } from '@chakra-ui/react'
import Bridge from './bridge/bridge';

function App() {
  return (
    <ChakraProvider>
      <div className="App w-screen h-screen bg-black">
        <div className='container mx-auto w-full h-full'>
          <Box position='relative' h='full' w='full'>
            <AbsoluteCenter bg='silver' h='50%' w='full' color='white' axis='both' className='rounded-lg'>
              <Bridge />
            </AbsoluteCenter>
          </Box>
        </div>
      </div>
    </ChakraProvider>
  );
}

export default App;
