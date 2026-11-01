import {redirect} from 'next/navigation';
import {currentOwner} from '@/lib/admin-server';
import OwnerAuth from '@/components/admin/OwnerAuth';
export const dynamic='force-dynamic';
export default async function Setup(){const owner=await currentOwner().catch(()=>null);if(owner)redirect('/admin');return <OwnerAuth setup/>;}
