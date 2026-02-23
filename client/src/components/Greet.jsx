"use client"
import Link from "next/link";

export default function Greet({ cookie_value }) {
    
        const details = cookie_value;
        
        return (
            <div>
                {details.name} ({details.email})
                <Link href={"/api/jobs"} prefetch={false}>Route to next page</Link>
            </div>
        );
}