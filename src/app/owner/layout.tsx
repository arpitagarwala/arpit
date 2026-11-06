import type {Metadata} from 'next';
export const metadata:Metadata={title:'Owner workspace',robots:{index:false,follow:false},alternates:{canonical:'/owner'}};
export default function OwnerLayout({children}:{children:React.ReactNode}){return children;}
