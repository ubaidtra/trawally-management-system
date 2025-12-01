# MongoDB Atlas Configuration

## Current Setup

The system is configured to use **MongoDB Atlas** - a cloud-hosted MongoDB database.

### Connection Details

- **Connection String:** `mongodb+srv://ubaidttech_db_user:tra@tech.281986@cluster0.lxszwnk.mongodb.net/`
- **Database Name:** `trawally-management`
- **Cluster:** `Cluster0`

### Benefits of Using MongoDB Atlas

1. **No Local Installation Required**
   - No need to install MongoDB on your computer
   - No need to run `mongod` command
   - Works immediately after npm install

2. **Cloud-Based**
   - Access from anywhere with internet
   - Automatic backups
   - High availability

3. **Easy to Use**
   - Just start the application with `npm start`
   - Database is always available
   - No maintenance required

## How It Works

The `.env` file contains:
```
MONGODB_URI=mongodb+srv://ubaidttech_db_user:tra%40tech.281986@cluster0.lxszwnk.mongodb.net/trawally-management?retryWrites=true&w=majority&appName=Cluster0
```

When you run `npm start`, the application automatically connects to your MongoDB Atlas cluster.

## Accessing Your Database

You can view and manage your database using:

1. **MongoDB Atlas Dashboard**
   - Go to: https://cloud.mongodb.com
   - Login with your MongoDB Atlas credentials
   - View collections, documents, and statistics

2. **MongoDB Compass** (Desktop App)
   - Download from: https://www.mongodb.com/try/download/compass
   - Connect using the connection string above
   - Visual interface for database management

## Database Collections

The system will automatically create these collections:

- `users` - Super Admin, CEO, and Admin accounts
- `staff` - Staff members
- `attendances` - Daily attendance records
- `contracts` - Contract information
- `services` - Service bookings
- `payments` - Payment records

## Backup and Restore

### Using MongoDB Atlas Dashboard:
1. Login to MongoDB Atlas
2. Go to your cluster
3. Click "..." menu → "Create Snapshot"
4. Snapshots are stored automatically

### Using mongodump (requires MongoDB tools):
```bash
mongodump --uri="mongodb+srv://ubaidttech_db_user:tra@tech.281986@cluster0.lxszwnk.mongodb.net/trawally-management" --out=./backup
```

### Restore:
```bash
mongorestore --uri="mongodb+srv://ubaidttech_db_user:tra@tech.281986@cluster0.lxszwnk.mongodb.net/trawally-management" ./backup/trawally-management
```

## Security Notes

1. **Connection String Security**
   - The connection string contains credentials
   - Keep the `.env` file secure
   - Don't share it publicly
   - Don't commit it to public repositories

2. **Changing Password**
   - If you need to change the database password:
     - Go to MongoDB Atlas Dashboard
     - Database Access → Edit User
     - Update password
     - Update `.env` file with new connection string

## Network Access

MongoDB Atlas requires IP whitelisting:
- Current setup should allow access from anywhere (0.0.0.0/0)
- For better security, you can restrict to specific IPs in Atlas dashboard

## Monitoring

In MongoDB Atlas Dashboard you can monitor:
- Database size
- Number of connections
- Query performance
- Storage usage
- Network traffic

## Troubleshooting

### Cannot Connect to Database
**Possible causes:**
1. No internet connection
2. IP address not whitelisted in Atlas
3. Incorrect credentials

**Solutions:**
1. Check internet connection
2. Login to Atlas → Network Access → Add your IP
3. Verify connection string in `.env` file

### Slow Performance
**Solutions:**
1. Check internet speed
2. Consider upgrading Atlas tier
3. Add database indexes (already configured)

## Cost

MongoDB Atlas offers:
- **Free Tier (M0):** 512MB storage - Perfect for this application
- **Paid Tiers:** More storage and features if needed

Current setup uses the free tier which is sufficient for the management system.

## Important Notes

1. **Always Online:** Database is always available (no need to start/stop)
2. **Automatic Backups:** Atlas handles backups automatically
3. **Scalable:** Can upgrade if you need more storage
4. **Secure:** Encrypted connections by default

## Support

For MongoDB Atlas issues:
- Documentation: https://docs.atlas.mongodb.com
- Support: https://support.mongodb.com

For Application Issues:
- Phone: +2203980627
- Phone: +2207980698

