use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub priority: String,
    pub status: String,
    pub project_id: Option<String>,
    pub tags: Vec<String>,
    pub due_date: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub completed_at: Option<String>,
}

#[tauri::command]
pub fn get_all_tasks() -> Result<Vec<Task>, String> {
    Ok(vec![])
}

#[tauri::command]
pub fn create_task(
    title: String,
    description: Option<String>,
    priority: Option<String>,
    project_id: Option<String>,
    due_date: Option<String>,
) -> Result<Task, String> {
    let now = chrono::Utc::now().to_rfc3339();
    let task = Task {
        id: uuid::Uuid::new_v4().to_string(),
        title,
        description,
        priority: priority.unwrap_or_else(|| "none".to_string()),
        status: "todo".to_string(),
        project_id,
        tags: vec![],
        due_date,
        created_at: now.clone(),
        updated_at: now,
        completed_at: None,
    };
    Ok(task)
}

#[tauri::command]
pub fn update_task(id: String, _title: Option<String>, _status: Option<String>) -> Result<Task, String> {
    Err(format!("Task {} not found", id))
}

#[tauri::command]
pub fn delete_task(_id: String) -> Result<bool, String> {
    Ok(true)
}
