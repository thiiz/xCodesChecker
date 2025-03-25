"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

type AnimationProps = {
    children: ReactNode;
    className?: string;
    delay?: number;
};

export function FadeIn({ children, className, delay = 0 }: AnimationProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay * 0.1 }}
            className={cn(className)}
        >
            {children}
        </motion.div>
    );
}

export function SlideIn({ children, className, delay = 0 }: AnimationProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: delay * 0.1 }}
            className={cn(className)}
        >
            {children}
        </motion.div>
    );
}

export function ScaleIn({ children, className, delay = 0 }: AnimationProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: delay * 0.1 }}
            className={cn(className)}
        >
            {children}
        </motion.div>
    );
}