# LazyDesk — Slow and Steady

> Submission draft for the DEV Hacktoberfest Open-Source AI Challenge. The hosted demo runs in deterministic demo mode; the local Ollama open-weight model path should be demonstrated separately before claiming it in a submission. Confirm the active challenge's deadline, tags and current rules before publishing.

## The busywork

Meeting notes and brain dumps bury decisions under paragraphs. People have to reread everything to find what they promised to do, which questions remain open, and what needs attention next.

## What I built

LazyDesk is a small notes-to-actions assistant. It presents a simple React workspace, accepts unstructured notes, and returns a concise summary, extracted action items and follow-up questions. Results can be copied or exported as Markdown.

## Why open innovation matters

The intended AI path runs an open-weight model through Ollama on the user's own machine. With that configuration, the notes are processed by a local model runtime rather than a closed cloud AI API. This gives users more control over model choice and where their private notes go.

The hosted demonstration uses an explicitly labelled deterministic parser because a normal web host does not provide a local Ollama model. It is a user-interface and flow demo, not evidence of hosted LLM inference. To evaluate the open-weight model path, run LazyDesk locally after installing Ollama and pulling the configured model.

## How to try it

- Live demo: https://lazydesk-web-final.onrender.com
- Source: https://github.com/gauravbalade/LazyDesk
- Local setup: see README.md
- API docs when running locally: http://127.0.0.1:8000/docs

## What I measured

Before making performance claims, test with representative notes and record:
- time to manually convert notes into tasks versus time with LazyDesk,
- whether summaries preserve key facts,
- whether extracted tasks are supported by the input,
- model latency and hardware used,
- confirmation that the local configuration does not send note text to a cloud model API.

## What comes next

This is an MVP, not a claim of perfect summarization. Next steps are improving task extraction, adding an evaluation set, improving accessibility, and validating the local model path across machines.

#devchallenge #hf26challenge
