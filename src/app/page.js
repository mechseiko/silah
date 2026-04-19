import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
 
export default function RootPage() {
  const cookieStore = cookies();
  const hasToken = true;
  // const hasToken = cookieStore.find(cookie => cookie.name === 'qf_access_token');
 
  if (hasToken) {
    redirect('/home');
  } else {
    redirect('/login');
  }
}