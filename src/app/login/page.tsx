import {redirect} from 'next/navigation';
import {currentOwner} from '@/lib/admin-server';
import OwnerAuth from '@/components/admin/OwnerAuth';
export const dynamic='force-dynamic';
export const metadata={title:'Owner sign in',robots:{index:false,follow:false},alternates:{canonical:'/login'}};
export default async function Login(){const owner=await currentOwner().catch(()=>null);if(owner)redirect('/admin');return <OwnerAuth/>;}
