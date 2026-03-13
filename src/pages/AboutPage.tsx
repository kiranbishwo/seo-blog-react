import { SEO } from "../components/SEO";

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <SEO
        title="About Bizzpur"
        description="Bizzpur is a Nepal-focused educational technology platform for exam prep: SEE, +2, and bachelor-level. Free past papers, study materials, and this blog for students across Nepal."
      />
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-8">
        About Bizzpur
      </h1>
      <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none">
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
          Bizzpur is a Nepal-focused educational technology platform designed to simplify academic
          preparation for students by providing a centralized digital archive of exam resources.
          The platform primarily serves students preparing for major academic levels in Nepal such
          as the Secondary Education Examination (SEE), +2 (Higher Secondary), and various
          bachelor-level programs offered by universities across the country.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
          Its main goal is to eliminate the common challenge many Nepali students face—searching
          through scattered sources to find past question papers and reliable study materials. By
          bringing these resources into one organized system, Bizzpur allows learners to easily
          browse subjects, select their education level, and instantly access past exam papers
          along with verified solutions prepared by experienced teachers and subject experts. The
          platform functions as a large online question bank containing thousands of exam papers
          collected over many years, helping students practice with real exam patterns and improve
          their understanding before final exams.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
          Beyond simply hosting past papers, Bizzpur positions itself as a broader learning
          ecosystem built to support student success. The platform offers features such as
          downloadable PDFs for offline study, structured subject categories, exam-style practice
          sessions, and tools like bookmarks and personal study notes that allow students to
          organize their preparation more effectively. It also aligns its content with major
          educational bodies in Nepal such as the National Examination Board (NEB) and
          universities including Tribhuvan University, Kathmandu University, and Pokhara
          University, ensuring that the materials correspond to real curricula and exam formats
          used in the country.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
          The mission behind Bizzpur is rooted in educational accessibility: the platform aims to
          keep study materials free and available to every student regardless of financial
          background, helping reduce dependence on expensive coaching classes or paid study guides.
          By offering free digital access to past papers and learning resources anytime through
          web and mobile devices, Bizzpur is working toward creating a more equal learning
          environment where students across Nepal can prepare smarter, practice more efficiently,
          and ultimately perform better in their examinations.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          This blog is part of Bizzpur. Here we share study tips, exam guides, and updates to
          support students preparing for SEE, +2, and university exams. We believe in clean
          design, useful content, and making information easy to find—so you can focus on
          learning.
        </p>
      </div>
    </div>
  );
}
