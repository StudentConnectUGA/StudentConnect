"use client";
import { useEffect, useState } from "react";
import CourseResultsGrid from "../CourseResultsGrid";

type Course = {
  id: string;
  prefix: string;
  number: string;
  title: string;
  availableTutors?: number;
};

export function PopularCourses() {
  const [results, setResults] = useState<Course[]>([]);

  useEffect(() => {
    // Simulate fetching data
    const fetchData = async () => {
      const response = await fetch("/api/courses?q=");
      const data = await response.json();
      const coursesWithTutors = data.courses.filter((course: Course) => course.availableTutors && course.availableTutors > 0);
      // sort
      coursesWithTutors.sort((a: Course, b: Course) => b.availableTutors! - a.availableTutors!);
      setResults(coursesWithTutors);
    };

    fetchData();
  }, []);

  return (
    <section id="courses" className="bg-uga-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-0 lg:py-14">
        <h2 className="text-xl font-semibold text-slate-900">Popular courses on StudentConnect</h2>
        <p className="mt-1 text-sm text-slate-600">Example courses with active tutors.</p>

        <CourseResultsGrid courses={results} />
      </div>
    </section>
  );
}
