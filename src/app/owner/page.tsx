import {requireOwner} from '@/lib/admin-server';
import OwnerWorkspace from '@/components/admin/OwnerWorkspace';
export const dynamic='force-dynamic';
export default async function Owner(){const owner=await requireOwner();return <OwnerWorkspace email={owner.email}/>;}
