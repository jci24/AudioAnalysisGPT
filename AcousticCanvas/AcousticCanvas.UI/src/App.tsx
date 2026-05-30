import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { AppLayout } from './components/AppLayout';
import { AppLogo } from './components/AppLogo';
import { theme } from './theme';

function App() {
  return (
    <MantineProvider theme={theme}>
      <ModalsProvider>
        <Notifications position="top-right" />
        <AppLayout>
          <AppLogo />
        </AppLayout>
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;
