'use client';
import {useState} from 'react';
import BackButton from '@/components/BackButton/BackButton';
import {ScreenTime} from '@/components/training/GameTime';
import {WorkoutHistory} from '@/components/training/TrainingViews';
import type {Level} from '@/lib/training';
import s from '@/components/training/training.module.css';
export default function ProgressClient(){const [level,setLevel]=useState<Level>('standard');return <main className={s.page}><BackButton/><div className={s.shell}><ScreenTime/><WorkoutHistory level={level} onLevel={setLevel}/></div></main>;}
