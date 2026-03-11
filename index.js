const { Client, Storage, Databases, ID } = require('node-appwrite');

module.exports = async function (req, res) {
  console.log("Node.js function started");
  
  try {
    // Health check for GET
    if (req.method === 'GET') {
      return res.json({ 
        success: true, 
        message: "Node.js upload function ready" 
      });
    }

    // Initialize Appwrite
    const client = new Client()
      .setEndpoint('https://nyc.cloud.appwrite.io/v1')
      .setProject('69ae895200286678d491')
      .setKey(process.env.APPWRITE_API_KEY);

    const storage = new Storage(client);
    const databases = new Databases(client);

    // Parse request
    const title = req.body?.title || 'Task';
    const employeeName = req.body?.employee_name || 'You';
    const priority = req.body?.priority || 'medium';

    // Check for file
    if (!req.bodyBinary) {
      return res.json({ success: false, error: 'No file uploaded' });
    }

    // Upload to Storage
    console.log("Uploading file...");
    const file = await storage.createFile(
      'task_attachments',
      ID.unique(),
      req.bodyBinary
    );

    // Generate URL
    const fileURL = `https://nyc.cloud.appwrite.io/v1/storage/buckets/task_attachments/files/${file.$id}/view?project=69ae895200286678d491`;

    // Save to Database
    const task = await databases.createDocument(
      '69ae89d3001994e32d91',
      'task',
      ID.unique(),
      {
        title: title,
        employee_name: employeeName,
        description: title,
        priority: priority,
        deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
        status: 'ongoing',
        url: fileURL
      }
    );

    return res.json({ success: true, $id: task.$id, url: fileURL });

  } catch (error) {
    console.error("Error:", error);
    return res.json({ success: false, error: error.message });
  }
};