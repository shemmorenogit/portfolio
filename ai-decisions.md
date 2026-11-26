# AI Decision Log - Module 3: Responsive Portfolio Layout

This document records key design and technical decisions made with AI assistance while building the responsive layout for my portfolio site.

## 1. Navigation Bar Layout: Flexbox vs. Grid
* **Decision:** Used **CSS Flexbox** (`display: flex; justify-content: space-between; align-items: center;`) for the main navigation bar.
* **Specific Reasoning:** Flexbox is ideal for a one-dimensional row layout (logo on the left, links on the right) and easily handles spacing and wrapping on mobile screens.

## 2. Project Section Layout: CSS Grid Cards
* **Decision:** Implemented **CSS Grid** with `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));` for the project cards section.
* **Specific Reasoning:** This eliminates rigid media queries by letting the browser automatically adjust columns based on screen width, ensuring cards never squish below 280px and reflow seamlessly from mobile to desktop.

## 3. Responsive Breakpoints & Mobile-First Adjustments
* **Decision:** Used a **mobile-first approach** with a media query breakpoint at `768px` (`@media (min-width: 768px)`).
* **Specific Reasoning:** Designing for mobile first ensures default CSS handles narrow phone screens cleanly, while the `768px` breakpoint expands padding, shifts hero content into a row, and optimizes desktop views.

## 4. Code Cleanup & Verification
* **Decision:** Removed unused helper classes and commented out experimental CSS generated during initial AI scaffolding.
* **Specific Reasoning:** Keeping the stylesheet clean and free of redundant rules meets the code quality rubric criteria and makes the repository easier to maintain.
