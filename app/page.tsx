import LogoutForm from '@/components/logoutForm';
import { getUser } from '@/utilities/lucia/auth';
import Login from './login/page';
import SignUp from './signup/page';

export default async function Home() {
  const user = await getUser();
  return (
    <main>
      <h1>it&apos;s a fresh build</h1>
      {user ? <LogoutForm /> : <Login />}
    </main>
  );
}
