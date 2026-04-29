use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub color: String,
    pub icon: Option<String>,
    pub archived: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[tauri::command]
pub fn get_all_projects() -> Result<Vec<Project>, String> {
    Ok(vec![])
}

#[tauri::command]
pub fn create_project(
    name: String,
    color: String,
    description: Option<String>,
    icon: Option<String>,
) -> Result<Project, String> {
    let now = chrono::Utc::now().to_rfc3339();
    let project = Project {
        id: uuid::Uuid::new_v4().to_string(),
        name,
        description,
        color,
        icon,
        archived: false,
        created_at: now.clone(),
        updated_at: now,
    };
    Ok(project)
}

#[tauri::command]
pub fn update_project(id: String, _name: Option<String>, _color: Option<String>) -> Result<Project, String> {
    Err(format!("Project {} not found", id))
}

#[tauri::command]
pub fn delete_project(_id: String) -> Result<bool, String> {
    Ok(true)
}
