export type Profile = Record<string, unknown>

export interface WorkExperience {
  id: number | string
  company: string
  jobTitle: string
  startDate: string
  endDate?: string
  description: string
  tags?: string[]
}

export interface EducationExperience {
  id: number | string
  school: string
  educationLevel: string
  startDate: string
  endDate?: string
  description: string
  tags?: string[]
}

export interface ProjectTechnology {
  name: string
  icon: string
}

export interface ProfileProject {
  id: number | string
  name: string
  description: string
  technologies: string[]
  technologyLogos: ProjectTechnology[]
  images: string[]
  url: string
  accentColor: string
}
