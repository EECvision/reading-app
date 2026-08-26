'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import styles from './Navbar.module.css';
import { ReactNode } from 'react';

interface NavbarProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

export function Navbar({ left, center, right }: NavbarProps) {
  return (
    <div className={styles.navbarWrapper}>
      <nav className={styles.navbar}>
        <div className={styles.left}>
          {left || (
            <Link href="/" className={styles.brand}>
              <span className={styles.logo}>📚</span>
              <span>Audiobooklm</span>
            </Link>
          )}
        </div>
        
        {center && (
          <div className={styles.center}>
            {center}
          </div>
        )}

        <div className={styles.right}>
          {right || <ThemeToggle />}
        </div>
      </nav>
    </div>
  );
}
