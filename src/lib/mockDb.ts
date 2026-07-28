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
  productType?: 'card' | 'board';
  previewUrl?: string;
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
    const cleanEmail = email.trim().toLowerCase();
    const existingUser = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

    if (existingUser) {
      if (!existingUser.password && password) {
        throw new Error('This account uses Google Sign-In. Please click the Google button below.');
      }
      // If signed in via Google or correct password, log them in
      if (!password || existingUser.password === password) {
        this.setCurrentUser(existingUser);
        return existingUser;
      }
      throw new Error('An account with this email already exists. Please log in.');
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email: email.trim(),
      password,
      name: name || email.split('@')[0],
      createdAt: Date.now()
    };
    this.saveUsers([...users, newUser]);
    this.setCurrentUser(newUser);
    return newUser;
  }

  async signIn(email: string, password?: string): Promise<User> {
    await delay(500);
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();

    // Passwordless / Google Sign-In
    if (!password) {
      let user = users.find(u => u.email.trim().toLowerCase() === cleanEmail);
      if (!user) {
        user = {
          id: crypto.randomUUID(),
          email: email.trim(),
          name: email.split('@')[0],
          createdAt: Date.now()
        };
        this.saveUsers([...users, user]);
      }
      this.setCurrentUser(user);
      return user;
    }

    // Email + Password Sign-In
    const user = users.find(u => u.email.trim().toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    if (!user.password && password) {
      throw new Error('This account uses Google Sign-In. Please click the Google button below.');
    }
    if (user.password !== password) {
      throw new Error('Invalid email or password');
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

  async updateUserName(userId: string, newName: string): Promise<void> {
    await delay(300);
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found.');
    }
    
    users[userIndex].name = newName;
    this.saveUsers(users);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.name = newName;
      this.setCurrentUser(currentUser);
    }
  }

  async changePassword(userId: string, newPassword: string): Promise<void> {
    await delay(500);
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found.');
    }
    
    if (!users[userIndex].password) {
      throw new Error('This account uses Google Sign-In and cannot have its password changed here.');
    }

    users[userIndex].password = newPassword;
    this.saveUsers(users);

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.password = newPassword;
      this.setCurrentUser(currentUser);
    }
  }

  // --- PROJECTS ---

  async saveProject(userId: string, name: string, data: any, previewUrl?: string, productType?: 'card' | 'board'): Promise<Project> {
    await delay(300);
    const projects: Project[] = JSON.parse(localStorage.getItem('mock_projects') || '[]');
    const newProject: Project = {
      id: crypto.randomUUID(),
      userId,
      name,
      data,
      previewUrl,
      productType,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    projects.push(newProject);
    localStorage.setItem('mock_projects', JSON.stringify(projects));
    return newProject;
  }

  async updateProject(userId: string, projectId: string, name: string, data: any, previewUrl?: string, productType?: 'card' | 'board'): Promise<Project> {
    await delay(300);
    const projects: Project[] = JSON.parse(localStorage.getItem('mock_projects') || '[]');
    const index = projects.findIndex(p => p.id === projectId && p.userId === userId);
    
    if (index === -1) {
      throw new Error('Project not found or unauthorized');
    }

    const updatedProject = {
      ...projects[index],
      name,
      data,
      previewUrl: previewUrl || projects[index].previewUrl,
      productType: productType || projects[index].productType,
      updatedAt: Date.now()
    };

    projects[index] = updatedProject;
    localStorage.setItem('mock_projects', JSON.stringify(projects));
    return updatedProject;
  }

  async getProjectById(userId: string, projectId: string): Promise<Project | null> {
    await delay(200);
    const projects: Project[] = JSON.parse(localStorage.getItem('mock_projects') || '[]');
    return projects.find(p => p.id === projectId && p.userId === userId) || null;
  }

  async deleteProject(userId: string, projectId: string): Promise<void> {
    await delay(200);
    let projects: Project[] = JSON.parse(localStorage.getItem('mock_projects') || '[]');
    const initialLength = projects.length;
    projects = projects.filter(p => !(p.id === projectId && p.userId === userId));
    
    if (projects.length === initialLength) {
      throw new Error('Project not found or unauthorized');
    }
    
    localStorage.setItem('mock_projects', JSON.stringify(projects));
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
