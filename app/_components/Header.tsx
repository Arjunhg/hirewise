import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

function Header() {
     return (
        <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
            <div className="flex items-center gap-2">
                <Image src={'/logo.svg'} width={40} height={40} alt="logo"/>
                <h1 className="text-base font-bold md:text-2xl">HireWise</h1>
            </div>
            {/* Toggle Theme */}
           <Link href={'/dashboard'}>
                <Button className="hover:cursor-pointer" size={'lg'}>
                    Login
                </Button>
           </Link>
        </nav>
    );
}

export default Header;