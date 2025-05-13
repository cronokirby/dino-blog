use anyhow::anyhow;
use chrono::prelude::*;
use clap::{Parser, Subcommand, arg};
use std::fs;
use std::io::{self, BufRead};

#[derive(Parser, Debug)]
#[command(name = "dino-cli")]
pub struct Opts {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand, Debug)]
pub enum Commands {
    Add {
        #[command(subcommand)]
        action: Add,
    },
}

#[derive(Subcommand, Debug)]
pub enum Add {
    Post {
        #[arg(long)]
        title: Option<String>,
    },
    Note {
        #[arg(long)]
        title: Option<String>,
    },
    Ref {
        #[arg(long)]
        title: Option<String>,
        #[arg(long)]
        date: Option<String>,
    },
}

fn prompt(p: &str) -> anyhow::Result<String> {
    let stdin = io::stdin();
    println!("{}", p);
    Ok(stdin.lock().lines().next().unwrap()?)
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Taxon {
    Post,
    Note,
    Ref,
}

impl Taxon {
    pub fn from_char(c: char) -> Option<Self> {
        match c {
            'P' => Some(Self::Post),
            'N' => Some(Self::Note),
            'R' => Some(Self::Ref),
            _ => None,
        }
    }

    pub fn to_char(&self) -> char {
        match self {
            Taxon::Post => 'P',
            Taxon::Note => 'N',
            Taxon::Ref => 'R',
        }
    }
}

#[derive(Clone, Copy)]
struct Code {
    taxon: Taxon,
    serial: u16,
}

impl Code {
    pub fn from_str(s: &str) -> Option<Self> {
        let mut chars = s.chars();
        let taxon = Taxon::from_char(chars.next()?)?;
        match chars.next() {
            Some('-') => {}
            _ => return None,
        };
        let filtered: String = chars.filter(|x| *x != '_').collect();
        let serial = u16::from_str_radix(&filtered, 16).ok()?;
        Some(Code { taxon, serial })
    }

    pub fn to_str(self) -> String {
        let base = format!("{:06X}", self.serial);
        let (part0, part1) = base.split_at(3);

        format!("{}-{}_{}", self.taxon.to_char(), part0, part1)
    }
}

struct Creation {
    taxon: Taxon,
    title: String,
}

impl Creation {
    pub fn create_interactive(taxon: Taxon, title: Option<String>) -> anyhow::Result<Self> {
        let title = match title {
            Some(x) => x,
            None => prompt("Title:")?,
        };
        Ok(Self { taxon, title })
    }

    pub fn effect(self) -> anyhow::Result<()> {
        let now = Local::now();
        let mut highest_serial: Option<u16> = None;
        let paths = fs::read_dir(".")?;
        for path in paths {
            let path = path?.path();
            let Some(stem) = path.file_stem() else {
                continue;
            };
            let Some(stem) = stem.to_str() else {
                continue;
            };
            let Some(code) = Code::from_str(stem) else {
                continue;
            };
            if code.taxon != self.taxon {
                continue;
            }
            highest_serial = Some(highest_serial.map_or(code.serial, |x| x.max(code.serial)));
        }
        let serial = match highest_serial {
            None => 0u16,
            Some(x) => x
                .checked_add(1)
                .ok_or(anyhow!("CONGRATULATIONS ON BEING A PROLIFIC WRITER"))?,
        };
        let code = Code {
            taxon: self.taxon,
            serial,
        };
        let mut contents = String::new();
        contents.push_str("---\n");
        contents.push_str(&format!("title: \"{}\"\n", self.title));
        contents.push_str(&format!("created: \"{}\"\n", now.format("%Y-%m-%d")));
        contents.push_str("---\n");
        fs::write(format!("{}.md", code.to_str()), contents)?;
        Ok(())
    }
}

fn main() -> anyhow::Result<()> {
    let opts = Opts::parse();
    let (taxon, title) = match opts.command {
        Commands::Add { action } => match action {
            Add::Post { title } => (Taxon::Post, title),
            Add::Note { title } => (Taxon::Note, title),
            Add::Ref { title, date: _ } => (Taxon::Ref, title),
        },
    };
    let creation = Creation::create_interactive(taxon, title)?;
    creation.effect()?;
    Ok(())
}
