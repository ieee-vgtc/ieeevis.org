# Based on second example from https://jekyllrb.com/docs/plugins/generators/
# Goal is to inject the ieeevis.org template into HTML content copied from
# content.ieeevis.org.
# 2024-06-17
# author: Dylan Cashman <dylancashman@brandeis.edu>
module ProgramPlugin
  class ProgramInjector < Jekyll::Generator
    safe true

    def generate(site)
      # puts "HELLO IM IN GENERATE IN THE PROGRAM PLUGIN"
      # puts site.static_files.first.name
      program_pages = site.static_files.find_all do |page|
        page.extname == ".html" && page.path.include?('program')
      end

      site.static_files = site.static_files.delete_if do |page|
        page.extname == ".html" && page.path.include?('program')
      end

      # puts "program_pages.size is #{program_pages.size}"
      # puts "site.pages.size is #{site.pages.size}"
      program_pages.each do |program_page|
        site.pages << ProgramPage.new(site, program_page)
      end
      # puts "after generating program pages, site.pages.size is #{site.pages.size}"
    end
  end

  # # Subclass of `Jekyll::Page` with custom method definitions.
  class ProgramPage < Jekyll::Page
    def initialize(site, static_page)
      @site = site             # the current site instance.
      @base = site.source      # path to the source directory.
      @dir  = "program"         # the directory the page will reside in.

      # All pages have the same filename, so define attributes straight away.
      @basename = static_page.basename
      @ext      = ".html"
      @name     = static_page.name

      # Initialize empty data hash
      @data = {}
      data["layout"] = "page"
      data["title"] = "Program"
      # data["permalink"] = "/program/static_page.basename"
      data["active_nav"] = "Program"
      data["contact"] = "web@ieeevis.org"

      process(name)
      # puts "#{static_page.basename}: before read_yaml, content is #{content}" if static_page.basename.include?("workshop")
      read_yaml(File.join(@base, @dir), name)
      # puts "#{static_page.basename}: after read_yaml, content is #{content}" if static_page.basename.include?("workshop")

      # data.default_proc = proc do |_, key|
      #   site.frontmatter_defaults.find(File.join(dir, name), type, key)
      # end

      Jekyll::Hooks.trigger :pages, :post_init, self
    end

    # Placeholders that are used in constructing page URL.
    def url_placeholders
      {
        :path       => @dir,
        :category   => @dir,
        :basename   => basename,
        :output_ext => output_ext,
      }
    end
  end
end