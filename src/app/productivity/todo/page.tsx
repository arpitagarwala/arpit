import {pageMetadata} from '@/lib/page-metadata';
import TodoClient from './TodoClient';
export const metadata=pageMetadata("/productivity/todo", {title:'Study Planner · Tasks',description:'Plan study tasks by subject, chapter or any nested categories, organise your day and week, and connect them to your focus history.',alternates:{canonical:'/productivity/todo'}});
export default function Page(){return <TodoClient/>;}
