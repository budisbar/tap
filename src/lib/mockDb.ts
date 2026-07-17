export interface User {
  id: string;
  email: string;
  password?: string; // Stored securely in a real DB, mocked here
  name?: string;
  createdAt: number;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  data: any;
  createdAt: number;
  updatedAt: number;
}

export interface ImageAsset {
  id: string;
  userId: string;
  url: string; // Data URL for local mocking
  createdAt: number;
}

export type CRMClientStatus = 'Emailed' | 'In Negotiation' | 'Rejected' | 'Buying';

export interface CRMClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: CRMClientStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class MockDatabase {
  private getUsers(): User[] {
    return JSON.parse(localStorage.getItem('mock_users') || '[]');
  }
  private saveUsers(users: User[]) {
    localStorage.setItem('mock_users', JSON.stringify(users));
  }

  // --- AUTHENTICATION ---
  
  async signUp(email: string, password?: string, name?: string): Promise<User> {
    await delay(500);
    const users = this.getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error('Email already in use');
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      password,
      name,
      createdAt: Date.now()
    };
    this.saveUsers([...users, newUser]);
    this.setCurrentUser(newUser);
    return newUser;
  }

  async signIn(email: string, password?: string): Promise<User> {
    await delay(500);
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user && password) { // if password is provided, must match
      throw new Error('Invalid email or password');
    } else if (!user) { // for google mock login if account doesn't exist
       return this.signUp(email, password, email.split('@')[0]);
    }
    this.setCurrentUser(user);
    return user;
  }

  async signOut(): Promise<void> {
    await delay(200);
    localStorage.removeItem('mock_current_user');
  }

  getCurrentUser(): User | null {
    const data = localStorage.getItem('mock_current_user');
    return data ? JSON.parse(data) : null;
  }

  private setCurrentUser(user: User) {
    localStorage.setItem('mock_current_user', JSON.stringify(user));
  }

  // --- PROJECTS ---

  async saveProject(userId: string, name: string, data: any): Promise<Project> {
    await delay(300);
    const projects: Project[] = JSON.parse(localStorage.getItem('mock_projects') || '[]');
    const newProject: Project = {
      id: crypto.randomUUID(),
      userId,
      name,
      data,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    projects.push(newProject);
    localStorage.setItem('mock_projects', JSON.stringify(projects));
    return newProject;
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    await delay(300);
    const projects: Project[] = JSON.parse(localStorage.getItem('mock_projects') || '[]');
    return projects.filter(p => p.userId === userId).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  // --- IMAGES ---

  async saveImage(userId: string, dataUrl: string): Promise<ImageAsset> {
    await delay(300);
    const images: ImageAsset[] = JSON.parse(localStorage.getItem('mock_images') || '[]');
    const newImage: ImageAsset = {
      id: crypto.randomUUID(),
      userId,
      url: dataUrl,
      createdAt: Date.now()
    };
    images.push(newImage);
    localStorage.setItem('mock_images', JSON.stringify(images));
    return newImage;
  }

  async getImagesByUser(userId: string): Promise<ImageAsset[]> {
    await delay(200);
    const images: ImageAsset[] = JSON.parse(localStorage.getItem('mock_images') || '[]');
    return images.filter(i => i.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  }

  // --- ADMIN ---
  async getAllUsers(): Promise<User[]> {
    await delay(200);
    return this.getUsers();
  }

  async getUserStats(userId: string): Promise<{ projectsCount: number, imagesCount: number }> {
    const projects: Project[] = JSON.parse(localStorage.getItem('mock_projects') || '[]');
    const images: ImageAsset[] = JSON.parse(localStorage.getItem('mock_images') || '[]');
    return {
      projectsCount: projects.filter(p => p.userId === userId).length,
      imagesCount: images.filter(i => i.userId === userId).length,
    };
  }
  // --- CRM ---
  
  async getCRMClients(): Promise<CRMClient[]> {
    await delay(200);
    return JSON.parse(localStorage.getItem('mock_crm_clients') || '[]');
  }

  async addCRMClient(clientData: Omit<CRMClient, 'id' | 'createdAt' | 'updatedAt'>): Promise<CRMClient> {
    await delay(200);
    const clients = await this.getCRMClients();
    const newClient: CRMClient = {
      ...clientData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    clients.push(newClient);
    localStorage.setItem('mock_crm_clients', JSON.stringify(clients));
    return newClient;
  }

  async updateCRMClientStatus(id: string, status: CRMClientStatus): Promise<void> {
    await delay(100);
    const clients = await this.getCRMClients();
    const index = clients.findIndex(c => c.id === id);
    if (index !== -1) {
      clients[index].status = status;
      clients[index].updatedAt = Date.now();
      localStorage.setItem('mock_crm_clients', JSON.stringify(clients));
    }
  }
}

export const db = new MockDatabase();
