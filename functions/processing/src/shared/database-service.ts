import { MongoClient, Collection } from 'mongodb';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export class DatabaseService {
  private static client: MongoClient | undefined;
  private static readonly secretsManagerClient = new SecretsManagerClient();
  private static readonly secretName = 'db-credentials'; // Name of the secret in Secrets Manager
  private static readonly DB_URI = process.env.DB_URI || '';
  private static readonly DB_NAME = process.env.DB_NAME || 'invoices';
  private static readonly COLLECTION_INVOICES = process.env.COLLECTION_INVOICES || 'results';
  private static readonly COLLECTION_STATISTICS = process.env.COLLECTION_STATISTICS || 'statistics';


  private static async getDatabaseCredentials(): Promise<{ username: string; password: string }> {
    const command = new GetSecretValueCommand({ SecretId: this.secretName });
    const response = await this.secretsManagerClient.send(command);

    if (!response.SecretString) {
      throw new Error('SecretString is undefined');
    }

    return JSON.parse(response.SecretString) as { username: string; password: string };
  }

  public static async connectToInvoices(): Promise<Collection> {
    let client = await this.connectToDatabase();

    const collection = client.db(this.DB_NAME).collection(this.COLLECTION_INVOICES);

    // Ensure required indices are created
    await collection.createIndex({ shop: 1 });
    await collection.createIndex({ createdAt: -1 });
    await collection.createIndex({ shop: 1, createdAt: -1 }); // Compound index on `shop` and `createdAt`
    await collection.createIndex({ 'items.name': 1 }); // Index on `items.name`

    return collection;
  }

  public static async connectToStatistics(): Promise<Collection> {
    let client = await this.connectToDatabase();

    const collection = client.db(this.DB_NAME).collection(this.COLLECTION_STATISTICS);

    // Ensure required indices are created
    //TODO

    return collection;
  }

  private static async connectToDatabase() {
    if (!this.client) {
      const { username, password } = await this.getDatabaseCredentials();
      const encodedPassword = encodeURIComponent(password);
      const uri = `mongodb://${username}:${encodedPassword}@${this.DB_URI}/?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred`;

      this.client = new MongoClient(uri, {
        tlsAllowInvalidCertificates: true,
        retryWrites: false,
      });

      await this.client.connect();
    }
    return this.client;
  }
}