module Ous
  class OusClient < BaseClient
    def get_ous_availability
      get('health')
    end

    def get_coverage(collection_id, params, token)
      default_params = {
        format: 'nc'
      }

      get("ous/collection/#{collection_id}", default_params.merge(params), token_header(token))
    end
  end
end
