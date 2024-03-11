import LogoutForm from '@/components/logoutForm';
import { getUser } from '@/utilities/lucia/auth';

export default async function Home() {
  const user = await getUser();
  return (
    <main>
      <h1>it&apos;s a fresh build</h1>
      {user ? <LogoutForm /> : <></>}
    </main>
  );
}
