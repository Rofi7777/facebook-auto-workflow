const { createClient } = require('@supabase/supabase-js');

class DatabaseAdminService {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('⚠️ Database Admin Service requires SUPABASE_SERVICE_KEY');
      this.client = null;
      this.enabled = false;
      return;
    }

    this.client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    this.enabled = true;
    console.log('🗄️ Database Admin Service initialized');
  }

  isEnabled() {
    return this.enabled;
  }

  async listTables() {
    if (!this.enabled) {
      return { tables: [], error: 'Service not enabled' };
    }

    try {
      const knownTables = [
        'user_interactions',
        'user_preferences', 
        'user_feedback'
      ];
      
      const tables = [];
      
      for (const tableName of knownTables) {
        try {
          const { count, error } = await this.client
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          
          if (!error) {
            tables.push({
              table_name: tableName,
              table_type: 'BASE TABLE',
              row_count: count || 0
            });
          }
        } catch (e) {
          tables.push({
            table_name: tableName,
            table_type: 'BASE TABLE',
            row_count: null
          });
        }
      }

      return { tables, error: null };
    } catch (err) {
      console.error('Error listing tables:', err);
      return { 
        tables: [
          { table_name: 'user_interactions', table_type: 'BASE TABLE', row_count: null },
          { table_name: 'user_preferences', table_type: 'BASE TABLE', row_count: null },
          { table_name: 'user_feedback', table_type: 'BASE TABLE', row_count: null }
        ], 
        error: null 
      };
    }
  }

  async getTableSchema(tableName) {
    if (!this.enabled) {
      return { columns: [], error: 'Service not enabled' };
    }

    const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');

    try {
      const { data, error } = await this.client.rpc('get_table_columns', { 
        p_table_name: sanitizedTableName 
      });

      if (error) {
        const schemaMap = {
          'user_interactions': [
            { column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'gen_random_uuid()' },
            { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
            { column_name: 'feature_tab', data_type: 'text', is_nullable: 'YES', column_default: null },
            { column_name: 'platform', data_type: 'text', is_nullable: 'YES', column_default: null },
            { column_name: 'industry', data_type: 'text', is_nullable: 'YES', column_default: null },
            { column_name: 'style', data_type: 'text', is_nullable: 'YES', column_default: null },
            { column_name: 'tone', data_type: 'text', is_nullable: 'YES', column_default: null },
            { column_name: 'language', data_type: 'text', is_nullable: 'YES', column_default: null },
            { column_name: 'metadata', data_type: 'jsonb', is_nullable: 'YES', column_default: null },
            { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()' }
          ],
          'user_preferences': [
            { column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'gen_random_uuid()' },
            { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
            { column_name: 'preferred_platforms', data_type: 'jsonb', is_nullable: 'YES', column_default: "'{}'" },
            { column_name: 'preferred_industries', data_type: 'jsonb', is_nullable: 'YES', column_default: "'{}'" },
            { column_name: 'preferred_styles', data_type: 'jsonb', is_nullable: 'YES', column_default: "'{}'" },
            { column_name: 'preferred_tones', data_type: 'jsonb', is_nullable: 'YES', column_default: "'{}'" },
            { column_name: 'language_preference', data_type: 'text', is_nullable: 'YES', column_default: null },
            { column_name: 'interaction_count', data_type: 'integer', is_nullable: 'YES', column_default: '0' },
            { column_name: 'last_active_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: null },
            { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()' },
            { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()' }
          ],
          'user_feedback': [
            { column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'gen_random_uuid()' },
            { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
            { column_name: 'interaction_id', data_type: 'uuid', is_nullable: 'YES', column_default: null },
            { column_name: 'feedback_type', data_type: 'text', is_nullable: 'NO', column_default: null },
            { column_name: 'rating', data_type: 'integer', is_nullable: 'YES', column_default: null },
            { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()' }
          ]
        };
        
        return { columns: schemaMap[sanitizedTableName] || [], error: null };
      }

      return { columns: data || [], error: null };
    } catch (err) {
      console.error('Error getting table schema:', err);
      return { columns: [], error: err.message };
    }
  }

  async fetchRows(tableName, options = {}) {
    if (!this.enabled) {
      return { rows: [], count: 0, error: 'Service not enabled' };
    }

    const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
    const { page = 1, pageSize = 50, orderBy = 'created_at', orderDir = 'desc', filters = {} } = options;
    const offset = (page - 1) * pageSize;

    try {
      let query = this.client
        .from(sanitizedTableName)
        .select('*', { count: 'exact' });

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '');
          if (typeof value === 'string' && value.includes('%')) {
            query = query.ilike(sanitizedKey, value);
          } else {
            query = query.eq(sanitizedKey, value);
          }
        }
      });

      if (orderBy) {
        const sanitizedOrderBy = orderBy.replace(/[^a-zA-Z0-9_]/g, '');
        query = query.order(sanitizedOrderBy, { ascending: orderDir === 'asc' });
      }

      query = query.range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching rows:', error);
        return { rows: [], count: 0, error: error.message };
      }

      return { rows: data || [], count: count || 0, error: null };
    } catch (err) {
      console.error('Error in fetchRows:', err);
      return { rows: [], count: 0, error: err.message };
    }
  }

  async insertRow(tableName, rowData) {
    if (!this.enabled) {
      return { success: false, error: 'Service not enabled' };
    }

    const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');

    try {
      const { data, error } = await this.client
        .from(sanitizedTableName)
        .insert(rowData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data, error: null };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async updateRow(tableName, rowId, rowData) {
    if (!this.enabled) {
      return { success: false, error: 'Service not enabled' };
    }

    const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');

    try {
      const { data, error } = await this.client
        .from(sanitizedTableName)
        .update(rowData)
        .eq('id', rowId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data, error: null };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async deleteRow(tableName, rowId) {
    if (!this.enabled) {
      return { success: false, error: 'Service not enabled' };
    }

    const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');

    try {
      const { error } = await this.client
        .from(sanitizedTableName)
        .delete()
        .eq('id', rowId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async deleteRows(tableName, rowIds) {
    if (!this.enabled) {
      return { success: false, error: 'Service not enabled' };
    }

    const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');

    try {
      const { error } = await this.client
        .from(sanitizedTableName)
        .delete()
        .in('id', rowIds);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, deletedCount: rowIds.length, error: null };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async runSql(sql) {
    if (!this.enabled) {
      return { success: false, error: 'Service not enabled' };
    }

    const upperSql = sql.trim().toUpperCase();
    const isReadOnly = upperSql.startsWith('SELECT') || 
                       upperSql.startsWith('WITH') ||
                       upperSql.startsWith('EXPLAIN');

    try {
      const { data, error } = await this.client.rpc('execute_sql', { query_text: sql });

      if (error) {
        if (error.message.includes('function') && error.message.includes('does not exist')) {
          return { 
            success: false, 
            error: 'SQL 執行功能需要在 Supabase 中建立 execute_sql 函數。請使用資料表瀏覽器進行操作。',
            needsSetup: true
          };
        }
        return { success: false, error: error.message };
      }

      return { success: true, data, isReadOnly, error: null };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async exportTable(tableName, format = 'json') {
    if (!this.enabled) {
      return { success: false, error: 'Service not enabled' };
    }

    const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');

    try {
      const { data, error } = await this.client
        .from(sanitizedTableName)
        .select('*')
        .limit(10000);

      if (error) {
        return { success: false, error: error.message };
      }

      if (format === 'csv') {
        if (!data || data.length === 0) {
          return { success: true, data: '', format: 'csv', error: null };
        }

        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        data.forEach(row => {
          const values = headers.map(header => {
            const val = row[header];
            if (val === null || val === undefined) return '';
            if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
            if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          });
          csvRows.push(values.join(','));
        });

        return { success: true, data: csvRows.join('\n'), format: 'csv', error: null };
      }

      return { success: true, data, format: 'json', error: null };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async getStats() {
    if (!this.enabled) {
      return { stats: null, error: 'Service not enabled' };
    }

    try {
      const stats = {
        tables: {},
        totalRecords: 0,
        lastUpdated: new Date().toISOString()
      };

      const tables = ['user_interactions', 'user_preferences', 'user_feedback'];
      
      for (const table of tables) {
        try {
          const { count, error } = await this.client
            .from(table)
            .select('*', { count: 'exact', head: true });

          if (!error) {
            stats.tables[table] = count || 0;
            stats.totalRecords += count || 0;
          } else {
            stats.tables[table] = 'N/A';
          }
        } catch (e) {
          stats.tables[table] = 'N/A';
        }
      }

      return { stats, error: null };
    } catch (err) {
      console.error('Error getting stats:', err);
      return { stats: null, error: err.message };
    }
  }

  async getRecentActivity(limit = 10) {
    if (!this.enabled) {
      return { activity: [], error: 'Service not enabled' };
    }

    try {
      const { data, error } = await this.client
        .from('user_interactions')
        .select('id, user_id, feature_tab, platform, industry, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { activity: [], error: error.message };
      }

      return { activity: data || [], error: null };
    } catch (err) {
      return { activity: [], error: err.message };
    }
  }
}

module.exports = new DatabaseAdminService();
