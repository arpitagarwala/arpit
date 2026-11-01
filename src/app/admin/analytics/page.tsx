import {requireOwner} from '@/lib/admin-server';
import {getSite} from '@/lib/site-server';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
export const dynamic='force-dynamic';
export const metadata={title:'Website analytics',robots:{index:false,follow:false},alternates:{canonical:'/admin/analytics'}};
export default async function AnalyticsPage(){const[owner,site]=await Promise.all([requireOwner(),getSite()]);return <AnalyticsDashboard initialDay={new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(new Date())} email={owner.email} collectionEnabled={site.features['analytics.collection']!==false}/>;}
