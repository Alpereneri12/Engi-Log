const Sorun = require("../models/sorunModel");

exports.generateSitemap = async (req, res) => {
    try {
        const baseUrl = req.protocol + '://' + req.get('host');//localhost:3000 burada base url olarak alınıyor


        const sorunlar = await Sorun.find({ 
            slug: { $ne: null, $exists: true } 
        }).select('slug updatedAt').sort({ createdAt: -1 });
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
       
        
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        xml += '  <url>\n';
        
        
        xml += `    <loc>${baseUrl}/</loc>\n`;
        
        
        xml += '    <changefreq>daily</changefreq>\n';
      
        
        xml += '    <priority>1.0</priority>\n';
    
        
        xml += '  </url>\n';
       


        xml += '  <url>\n';
  
        
        xml += `    <loc>${baseUrl}/sorunlar</loc>\n`;
      
        
        xml += '    <changefreq>daily</changefreq>\n';

        xml += '    <priority>0.8</priority>\n';
      
        
        xml += '  </url>\n';
      


        for (const sorun of sorunlar) {
            xml += '  <url>\n';
            //Her sorun için yeni URL container'ı
            
            xml += `    <loc>${baseUrl}/sorunlar/${sorun.slug}</loc>\n`;
          
            
            xml += '    <changefreq>weekly</changefreq>\n';
            //Haftalık güncellenir (çözümler eklendikçe)
            
            //Son güncelleme tarihini ekle (eğer varsa)
            if (sorun.updatedAt) {
                //ISO 8601 formatında tarih (sitemap standardı)
                const lastmod = new Date(sorun.updatedAt).toISOString();
                xml += `    <lastmod>${lastmod}</lastmod>\n`;

            }
            
            xml += '    <priority>0.6</priority>\n';
            //Orta öncelik (detay sayfaları)
            
            xml += '  </url>\n';
            //Bu sorunun URL'i kapatıldı
        }


        xml += '</urlset>\n';
        // urlset container'ı kapatıldı


        // Content-Type: application/xml (sitemap standardı)
        res.set('Content-Type', 'application/xml');
        // HTTP header'ına Content-Type ekleniyor
        
        // XML string'ini response olarak gönder
        res.send(xml);
        // res.send() ile XML içeriği client'a gönderiliyor
        
    } catch (err) {

        console.error("Sitemap oluşturma hatası:", err);
        // Hata konsola yazdırılıyor
        
        // Hata durumunda boş bir sitemap döndür (en azından ana sayfa olsun)
        const baseUrl = req.protocol + '://' + req.get('host');
        const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
        
        res.set('Content-Type', 'application/xml');
        res.status(500).send(errorXml);
        // Hata olsa bile en azından ana sayfayı içeren bir sitemap döndür
    }
};

