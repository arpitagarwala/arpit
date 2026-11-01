import {notFound} from 'next/navigation';
import {getSite} from '@/lib/site-server';
import ProgressClient from './ProgressClient';
export const metadata={title:'Your training progress · Logic room',description:'Your personal arithmetic accuracy, response times, daily streaks and puzzle practice history.',robots:{index:false,follow:false}};
export default async function Page(){const site=await getSite();if(site.features['games.progress']===false)notFound();return <ProgressClient/>;}
